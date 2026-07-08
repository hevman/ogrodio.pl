import { NextResponse } from "next/server";
import { getTaskProductsMap, type TaskProductRequest } from "@/lib/task-shop";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = Array.isArray(body?.tasks) ? (body.tasks as TaskProductRequest[]) : [];
    if (!tasks.length) {
      return NextResponse.json({ products: {} });
    }
    const products = await getTaskProductsMap(tasks.slice(0, 12), 2);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: {} }, { status: 500 });
  }
}
