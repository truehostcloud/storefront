"use server";

import type {
  PaginatedResponse,
  Product,
  ProductFiltersResponse,
  ProductListParams,
} from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import {
  getAccessToken,
  getClientForConfig,
  getLocaleOptions,
  getSpreeCacheScope,
  resolveSpreeConfig,
} from "@/lib/spree";

function hasValidSpreeConfig(
  baseUrl?: string,
  publishableKey?: string,
): boolean {
  return Boolean(
    baseUrl?.trim() &&
      publishableKey?.trim() &&
      /^https?:\/\//i.test(baseUrl.trim()),
  );
}

function createEmptyPaginatedProductsResponse(
  params?: ProductListParams,
): PaginatedResponse<Product> {
  return {
    data: [],
    meta: {
      count: 0,
      pages: 0,
      page: Number(params?.page ?? 1),
      limit: Number(params?.limit ?? 0),
      from: 0,
      to: 0,
      in: [],
      previous: null,
      next: null,
    },
  } as unknown as PaginatedResponse<Product>;
}

function createEmptyProductFiltersResponse(): ProductFiltersResponse {
  return {
    filters: [],
    sort_options: [],
    default_sort: "",
    total_count: 0,
  } as unknown as ProductFiltersResponse;
}

/**
 * Cached product list fetch. Cache key is derived from all function
 * arguments by Next.js "use cache":
 *
 * - locale/country: determines language and market-specific pricing
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Each user's JWT is unique so the cache is segmented per user.
 *   Guest users pass undefined.
 */
export async function cachedListProducts(
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
  _userToken?: string,
  baseUrl?: string,
  publishableKey?: string,
  _spreeScope?: string,
): Promise<PaginatedResponse<Product>> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("products");
  if (!hasValidSpreeConfig(baseUrl, publishableKey)) {
    return createEmptyPaginatedProductsResponse(params);
  }

  return getClientForConfig({
    baseUrl: baseUrl ?? "",
    publishableKey: publishableKey ?? "",
  }).products.list(params, options);
}

export async function getProducts(
  params?: ProductListParams,
): Promise<PaginatedResponse<Product>> {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  const spreeConfig = await resolveSpreeConfig();
  return cachedListProducts(
    params,
    options,
    userToken,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

/**
 * Persistent cached product detail fetch. Cache key is derived from:
 *
 * - slugOrId, expand: identify the product and response shape
 * - locale/country: determines language and market-specific pricing
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Guest users pass undefined, so all guests share one entry.
 */
export async function cachedGetProduct(
  slugOrId: string,
  expand: string[],
  options: { locale?: string; country?: string },
  _userToken?: string,
  baseUrl?: string,
  publishableKey?: string,
  _spreeScope?: string,
): Promise<Product> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("products", `product:${slugOrId}`);
  if (!hasValidSpreeConfig(baseUrl, publishableKey)) {
    throw new Error("Spree client is not configured for this store.");
  }

  return getClientForConfig({
    baseUrl: baseUrl ?? "",
    publishableKey: publishableKey ?? "",
  }).products.get(slugOrId, { expand }, options);
}

export async function getProduct(
  slugOrId: string,
  params?: { expand?: string[] },
): Promise<Product> {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  const spreeConfig = await resolveSpreeConfig();
  return cachedGetProduct(
    slugOrId,
    params?.expand ?? [],
    options,
    userToken,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

async function cachedGetProductFilters(
  params: Record<string, unknown> | undefined,
  options: { locale?: string; country?: string },
  _userToken?: string,
  baseUrl?: string,
  publishableKey?: string,
  _spreeScope?: string,
): Promise<ProductFiltersResponse> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("product-filters");
  if (!hasValidSpreeConfig(baseUrl, publishableKey)) {
    return createEmptyProductFiltersResponse();
  }

  return getClientForConfig({
    baseUrl: baseUrl ?? "",
    publishableKey: publishableKey ?? "",
  }).products.filters(params, options);
}

export async function getProductFilters(
  params?: Record<string, unknown>,
): Promise<ProductFiltersResponse> {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  const spreeConfig = await resolveSpreeConfig();
  return cachedGetProductFilters(
    params,
    options,
    userToken,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}
