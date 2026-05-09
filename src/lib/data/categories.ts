"use server";

import type {
  Category,
  CategoryListParams,
  PaginatedResponse,
  Product,
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

function createEmptyPaginatedResponse<T>(params?: {
  page?: number;
  limit?: number;
}): PaginatedResponse<T> {
  return {
    data: [],
    meta: {
      count: 0,
      pages: 0,
      page: Number(params?.page ?? 1),
      limit: Number(params?.limit ?? 0),
      from: 0,
      to: 0,
      in: 0,
      previous: null,
      next: null,
    },
  } as unknown as PaginatedResponse<T>;
}

async function cachedListCategories(
  params: CategoryListParams | undefined,
  options: { locale?: string; country?: string },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("categories");
  if (!hasValidSpreeConfig(baseUrl, publishableKey)) {
    return createEmptyPaginatedResponse<Category>(params);
  }

  return getClientForConfig({ baseUrl, publishableKey }).categories.list(
    params,
    options,
  );
}

export async function getCategories(params?: CategoryListParams) {
  const options = await getLocaleOptions();
  const spreeConfig = await resolveSpreeConfig();
  return cachedListCategories(
    params,
    options,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

async function cachedGetCategory(
  idOrPermalink: string,
  params: { expand?: string[] } | undefined,
  options: { locale?: string; country?: string },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("category");
  return getClientForConfig({ baseUrl, publishableKey }).categories.get(
    idOrPermalink,
    params,
    options,
  );
}

export async function getCategory(
  idOrPermalink: string,
  params?: { expand?: string[] },
) {
  const options = await getLocaleOptions();
  const spreeConfig = await resolveSpreeConfig();
  return cachedGetCategory(
    idOrPermalink,
    params,
    options,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

/**
 * Persistent cached category products fetch. Cache key is derived from
 * all function arguments (categoryId, params, locale, country, userToken).
 * Guest users pass undefined so the cache entry is shared.
 */
async function cachedListCategoryProducts(
  categoryId: string,
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
  _userToken?: string,
  baseUrl?: string,
  publishableKey?: string,
  _spreeScope?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("products", `category-products:${categoryId}`);
  if (!hasValidSpreeConfig(baseUrl, publishableKey)) {
    return createEmptyPaginatedResponse<Product>(params);
  }

  return getClientForConfig({
    baseUrl: baseUrl ?? "",
    publishableKey: publishableKey ?? "",
  }).products.list({ ...params, in_category: categoryId }, options);
}

export async function getCategoryProducts(
  categoryId: string,
  params?: ProductListParams,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  const spreeConfig = await resolveSpreeConfig();
  return cachedListCategoryProducts(
    categoryId,
    params,
    options,
    userToken,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}
