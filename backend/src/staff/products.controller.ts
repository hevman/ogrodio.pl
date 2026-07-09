import { Controller, Get, Param, Query, Put, Body, UseGuards, Post, Delete } from '@nestjs/common';
import { Permission, StaffJwtGuard } from './staff-auth.guard';
import { SyncAuthGuard } from './sync-auth.guard';
import { VendureAdminService } from './vendure-admin.service';

@Controller('panel-api/staff/products')
export class ProductsController {
  constructor(private readonly vendure: VendureAdminService) {}

  @Get()
  @UseGuards(StaffJwtGuard)
  @Permission('products')
  async list(@Query('page') page?: string, @Query('q') q?: string) {
    const take = 20;
    const skip = ((Number(page) || 1) - 1) * take;
    const data = await this.vendure.query(`
      query ($take: Int, $skip: Int, $filter: ProductFilterParameter) {
        products(options: { take: $take, skip: $skip, filter: $filter, sort: { name: ASC } }) {
          totalItems
          items {
            id name slug enabled
            featuredAsset { preview }
            variants { id name sku priceWithTax stockLevel }
          }
        }
        facets {
          id name code
          values { id name code }
        }
      }
    `, {
      take,
      skip,
      filter: q ? { name: { contains: q } } : undefined,
    }) as any;
    return { products: data?.products ?? { totalItems: 0, items: [] }, facets: data?.facets ?? [] };
  }

  @Get('tax-categories')
  @UseGuards(StaffJwtGuard)
  @Permission('products')
  async getTaxCategories() {
    const data = await this.vendure.query(`
      query {
        taxCategories {
          id name
        }
      }
    `) as any;
    return data?.taxCategories ?? [];
  }

  @Get(':id')
  @UseGuards(StaffJwtGuard)
  @Permission('products')
  async getOne(@Param('id') id: string) {
    const data = await this.vendure.query(`
      query ($id: ID!) {
        product(id: $id) {
          id name slug description enabled
          featuredAsset { id preview source }
          assets { id preview source }
          variants {
            id name sku priceWithTax stockLevel enabled
            taxCategory { id name }
            options { code name group { name } }
          }
          collections { id name slug }
          facetValues { id name facet { name } }
        }
      }
    `, { id }) as any;
    return data?.product ?? null;
  }

  @Put(':id')
  @UseGuards(StaffJwtGuard)
  @Permission('products')
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string; enabled?: boolean; featuredAssetId?: string; facetValueIds?: string[] }) {
    const input: Record<string, unknown> = { id };
    if (typeof body.enabled === 'boolean') input.enabled = body.enabled;
    if (body.featuredAssetId) input.featuredAssetId = body.featuredAssetId;
    if (body.facetValueIds) input.facetValueIds = body.facetValueIds;
    if (body.name || body.description) {
      input.translations = [{
        languageCode: 'pl',
        name: body.name,
        description: body.description,
      }];
    }

    const data = await this.vendure.query(`
      mutation UpdateProduct($input: UpdateProductInput!) {
        updateProduct(input: $input) {
          id name slug description enabled
          variants {
            id name sku priceWithTax stockLevel enabled
          }
        }
      }
    `, { input }) as any;
    return data?.updateProduct ?? null;
  }

  @Put(':productId/variants/:variantId')
  @UseGuards(StaffJwtGuard)
  @Permission('products')
  async updateVariant(@Param('productId') productId: string, @Param('variantId') variantId: string, @Body() body: { sku?: string; name?: string; price?: number; stockLevel?: string; enabled?: boolean; taxCategoryId?: string }) {
    const input: Record<string, unknown> = { id: variantId };
    if (typeof body.price === 'number') input.price = body.price;
    if (body.sku) input.sku = body.sku;
    if (typeof body.enabled === 'boolean') input.enabled = body.enabled;
    if (body.taxCategoryId) input.taxCategoryId = body.taxCategoryId;

    const data = await this.vendure.query(`
      mutation UpdateProductVariant($input: UpdateProductVariantInput!) {
        updateProductVariant(input: $input) {
          id name sku priceWithTax stockLevel enabled
          taxCategory { id name }
          options { code name group { name } }
        }
      }
    `, { input }) as any;
    return data?.updateProductVariant ?? null;
  }

  @Post()
  @UseGuards(SyncAuthGuard)
  async create(@Body() body: { 
    name: string; 
    slug?: string; 
    description?: string; 
    enabled?: boolean;
    featuredAssetId?: string;
    facetValueIds?: string[];
    taxCategoryId?: string;
    price: number;
    sku: string;
  }) {
    const data = await this.vendure.query(`
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id name slug description enabled
          featuredAsset { id preview source }
          assets { id preview source }
          variants {
            id name sku priceWithTax stockLevel enabled
            taxCategory { id name }
            options { code name group { name } }
          }
          collections { id name slug }
          facetValues { id name facet { name } }
        }
      }
    `, {
      input: {
        ...body,
        translations: [
          {
            languageCode: 'pl',
            name: body.name,
            slug: body.slug,
            description: body.description,
          },
        ],
        variantIds: [],
      },
    }) as any;
    return data?.createProduct ?? null;
  }

  @Delete(':id')
  @UseGuards(SyncAuthGuard)
  async remove(@Param('id') id: string) {
    const data = await this.vendure.query(`
      mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id) {
          id name slug
        }
      }
    `, { id }) as any;
    return data?.deleteProduct ?? null;
  }
}
