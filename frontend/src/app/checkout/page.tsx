"use client";

import { Check, CreditCard, MapPin, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { CartItem, CheckoutAddress, PaymentMethod, Product, ShippingMethod } from "@/lib/shop-api";
import {
  activeOrder,
  completeVendureCheckout,
  eligiblePaymentMethods,
  eligibleShippingMethods,
  fetchProducts,
  syncVendureCart,
} from "@/lib/shop-api";
import { formatMoney, t } from "@/i18n";

const emptyAddress: CheckoutAddress = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  streetLine1: "",
  city: "",
  postalCode: "",
};

const checkoutSteps = [
  "shop.checkout.stepDelivery",
  "shop.checkout.stepShippingPayment",
  "shop.checkout.stepConfirmation",
] as const;

const addressFields = [
  ["fullName", "shop.checkout.fullName"],
  ["emailAddress", "shop.checkout.email"],
  ["phoneNumber", "shop.checkout.phone"],
  ["streetLine1", "shop.checkout.street"],
  ["postalCode", "shop.checkout.postalCode"],
  ["city", "shop.checkout.city"],
] as const;

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [status, setStatus] = useState(t("shop.checkout.preparing"));
  const [orderCode, setOrderCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDigitalDelivery, setAcceptedDigitalDelivery] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("garden-vendure-cart") || "[]") as CartItem[];
    setCart(Array.isArray(saved) ? saved : []);

    fetchProducts()
      .then((items) => setProducts(items))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!cart.length) {
      setStatus(t("shop.checkout.emptyCart"));
      return;
    }

    setStatus(t("shop.checkout.syncing"));
    syncVendureCart(cart)
      .then(() => Promise.all([activeOrder(), eligibleShippingMethods(), eligiblePaymentMethods()]))
      .then(([order, shipping, payment]) => {
        setShippingMethods(shipping);
        setPaymentMethods(payment);
        setShippingMethodId(shipping[0]?.id || "");
        setPaymentMethodCode(payment[0]?.code || "payment-on-confirmation");
        setStatus(order ? "" : t("common.orderPrepareFailed"));
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("common.checkoutPrepareFailed")));
  }, [cart]);

  const productByVariant = useMemo(
    () => new Map(products.map((product) => [product.variantId, product])),
    [products],
  );
  const lines = cart
    .map((item) => {
      const product = productByVariant.get(item.productVariantId);
      return product ? { ...item, product, total: product.price * item.quantity } : null;
    })
    .filter(Boolean) as Array<CartItem & { product: Product; total: number }>;
  const subtotal = lines.reduce((sum, item) => sum + item.total, 0);
  const containsDigitalProduct = lines.some((line) => line.product.category === "ebooki");
  const visibleShippingMethods = useMemo(
    () =>
      shippingMethods.filter((method) =>
        containsDigitalProduct ? method.code === "dostawa-cyfrowa" : method.code !== "dostawa-cyfrowa",
      ),
    [containsDigitalProduct, shippingMethods],
  );
  const shipping = visibleShippingMethods.find((method) => method.id === shippingMethodId) || visibleShippingMethods[0];
  const shippingPrice = shipping?.price || 0;
  const total = subtotal + shippingPrice;

  useEffect(() => {
    if (!visibleShippingMethods.length) return;
    if (!visibleShippingMethods.some((method) => method.id === shippingMethodId)) {
      setShippingMethodId(visibleShippingMethods[0].id);
    }
  }, [shippingMethodId, visibleShippingMethods]);

  function updateAddress(field: keyof CheckoutAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(t("shop.checkout.placing"));
    try {
      const order = await completeVendureCheckout({
        address,
        shippingMethodId,
        paymentMethodCode,
      });
      setOrderCode(order.code);
      window.localStorage.setItem("garden-vendure-cart", "[]");
      window.dispatchEvent(new Event("garden-cart-updated"));
      setCart([]);
      setStatus(t("shop.checkout.orderSaved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("common.orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderCode) {
    return (
      <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
          <Check className="mx-auto h-12 w-12 text-emerald-700" />
          <p className="mt-4 text-sm font-black uppercase text-emerald-700">{t("shop.checkout.orderAccepted")}</p>
          <h1 className="mt-2 text-4xl font-black">{t("shop.checkout.orderNumber", { code: orderCode })}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{status}</p>
          <Link className="mt-6 inline-flex h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white" href="/">
            {t("common.backToShop")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f7f2] text-slate-950">
      <section className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto max-w-[1680px] px-6 py-8 2xl:px-8">
          <p className="text-sm font-black uppercase text-emerald-700">{t("shop.checkout.title")}</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">{t("shop.checkout.deliveryAndPayment")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("shop.checkout.intro")}</p>
          <div className="mt-6 grid gap-3 text-sm font-black sm:grid-cols-3">
            {checkoutSteps.map((stepKey, index) => (
              <div className={`rounded-lg border px-4 py-3 ${index === 0 ? "border-emerald-700 bg-emerald-50 text-emerald-950" : "border-slate-200 bg-white text-slate-600"}`} key={stepKey}>
                {t(stepKey)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-6 px-6 py-8 lg:grid-cols-[1fr_430px] 2xl:px-8">
        <form className="grid gap-5" onSubmit={submitOrder}>
          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <MapPin className="h-5 w-5 text-emerald-700" />
              {t("shop.checkout.deliveryAddress")}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {addressFields.map(([field, labelKey]) => (
                <label className="grid gap-2 text-sm font-bold text-slate-700" key={field}>
                  {t(labelKey)}
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 outline-none transition focus:border-emerald-600"
                    onChange={(event) => updateAddress(field, event.target.value)}
                    required
                    type={field === "emailAddress" ? "email" : "text"}
                    value={address[field]}
                  />
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Truck className="h-5 w-5 text-emerald-700" />
              {t("shop.checkout.shippingMethod")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("shop.checkout.shippingEta")}</p>
            <div className="mt-5 grid gap-3">
              {visibleShippingMethods.map((method) => (
                <label className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 ${shippingMethodId === method.id ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`} key={method.id}>
                  <span>
                    <span className="block font-black">{method.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{method.description}</span>
                  </span>
                  <span className="flex items-center gap-3 font-black">
                    {formatMoney(method.price)}
                    <input checked={shippingMethodId === method.id} onChange={() => setShippingMethodId(method.id)} type="radio" />
                  </span>
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <CreditCard className="h-5 w-5 text-emerald-700" />
              {t("shop.checkout.paymentMethod")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Wybierz aktywną metodę płatności. Szybkie płatności Autopay są przygotowane jako kolejny etap, ale teraz nie są dostępne dla klienta.
            </p>
            <div className="mt-5 grid gap-3">
              {paymentMethods.map((method) => (
                <label className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 ${paymentMethodCode === method.code ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`} key={method.code}>
                  <span>
                    <span className="block font-black">{method.name || "Przelew tradycyjny"}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      {method.description || "Po złożeniu zamówienia otrzymasz dane do przelewu. E-book wysyłamy po zaksięgowaniu płatności."}
                    </span>
                  </span>
                  <input checked={paymentMethodCode === method.code} onChange={() => setPaymentMethodCode(method.code)} type="radio" />
                </label>
              ))}
              <div className="flex items-start justify-between gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">
                <span>
                  <span className="block font-black">Autopay / BLIK / szybki przelew</span>
                  <span className="mt-1 block text-sm leading-6">Płatności automatyczne będą dostępne po aktywacji operatora.</span>
                </span>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-black uppercase text-slate-500">wkrótce</span>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">{t("shop.checkout.termsTitle")}</h2>
            <label className="mt-4 flex items-start gap-3 text-sm font-bold leading-6 text-slate-700">
              <input className="mt-1" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required type="checkbox" />
              <span>Akceptuję <Link className="font-black text-emerald-800 underline" href="/regulamin" target="_blank">regulamin sklepu</Link> i zapoznałem się z <Link className="font-black text-emerald-800 underline" href="/polityka-prywatnosci" target="_blank">polityką prywatności</Link>.</span>
            </label>
            {containsDigitalProduct ? (
              <label className="mt-4 flex items-start gap-3 text-sm font-bold leading-6 text-slate-700">
                <input className="mt-1" checked={acceptedDigitalDelivery} onChange={(event) => setAcceptedDigitalDelivery(event.target.checked)} required type="checkbox" />
                <span>Wyrażam zgodę na dostarczenie e-booka przed upływem 14 dni i przyjmuję do wiadomości, że po dostarczeniu treści cyfrowej utracę prawo odstąpienia od umowy.</span>
              </label>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <span className="rounded-lg bg-slate-50 p-3 font-bold">{t("shop.checkout.returnWindow")}</span>
              <span className="rounded-lg bg-slate-50 p-3 font-bold">{t("shop.checkout.contactBeforeShipping")}</span>
              <span className="rounded-lg bg-slate-50 p-3 font-bold">{t("shop.checkout.orderStatusHint")}</span>
            </div>
          </article>

          {status ? <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">{status}</p> : null}

          <button
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 font-black text-white disabled:opacity-50"
            disabled={!cart.length || !shippingMethodId || !paymentMethodCode || !acceptedTerms || (containsDigitalProduct && !acceptedDigitalDelivery) || isSubmitting}
            type="submit"
          >
            <PackageCheck className="h-5 w-5" />
            Kupuję i płacę
          </button>
        </form>

        <aside className="self-start rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm lg:sticky lg:top-36">
          <h2 className="text-xl font-black">{t("shop.checkout.summary")}</h2>
          <div className="mt-5 grid gap-3">
            {lines.length ? lines.map((line) => (
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3" key={line.productVariantId}>
                <div>
                  <p className="font-black">{line.product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("shop.checkout.lineQuantity", { quantity: line.quantity, price: formatMoney(line.product.price) })}
                  </p>
                </div>
                <strong>{formatMoney(line.total)}</strong>
              </div>
            )) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600">{t("shop.checkout.emptyCart")}</p>
            )}
          </div>
          <div className="mt-5 grid gap-2 text-sm">
            <p className="flex justify-between"><span>{t("shop.checkout.subtotal")}</span><strong>{formatMoney(subtotal)}</strong></p>
            <p className="flex justify-between"><span>{t("shop.checkout.shipping")}</span><strong>{formatMoney(shippingPrice)}</strong></p>
            <p className="flex justify-between border-t border-slate-200 pt-3 text-xl font-black"><span>{t("common.total")}</span><span>{formatMoney(total)}</span></p>
          </div>
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <p className="font-black">{t("shop.checkout.whatsNext")}</p>
            <p className="mt-1">{t("shop.checkout.whatsNextText")}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
