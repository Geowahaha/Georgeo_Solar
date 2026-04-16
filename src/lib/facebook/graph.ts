/**
 * Facebook Graph API (official API only — requires Page access token).
 * Docs: https://developers.facebook.com/docs/graph-api
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getConfig() {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId =
    process.env.FACEBOOK_PAGE_ID ?? process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  return { accessToken, pageId };
}

export function isFacebookGalleryConfigured(): boolean {
  const { accessToken, pageId } = getConfig();
  return Boolean(accessToken && pageId);
}

type GraphError = { error?: { message?: string; type?: string } };

async function graphFetch<T>(path: string, searchParams: Record<string, string>) {
  const { accessToken, pageId } = getConfig();
  if (!accessToken || !pageId) {
    return { ok: false as const, error: "Facebook is not configured." };
  }

  const url = new URL(`${GRAPH_BASE}/${path}`);
  url.searchParams.set("access_token", accessToken);
  for (const [k, v] of Object.entries(searchParams)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  const json = (await res.json()) as T & GraphError;

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? res.statusText;
    return { ok: false as const, error: msg };
  }

  return { ok: true as const, data: json };
}

export type RawAlbum = {
  id: string;
  name?: string;
  description?: string;
  created_time?: string;
  count?: number;
  link?: string;
  cover_photo?: { images?: { source?: string }[] };
};

export type RawPhoto = {
  id: string;
  images?: { source?: string; width?: number; height?: number }[];
  link?: string;
  created_time?: string;
  name?: string;
};

type ListResponse<T> = { data?: T[]; paging?: { next?: string } };

export async function fetchPageAlbums() {
  const { pageId } = getConfig();
  if (!pageId) {
    return { ok: false as const, error: "FACEBOOK_PAGE_ID is not set." };
  }

  return graphFetch<ListResponse<RawAlbum>>(`${pageId}/albums`, {
    fields:
      "id,name,description,created_time,count,link,cover_photo{images.width(720).height(720)}",
    limit: "50",
  });
}

export async function fetchAlbumPhotos(albumId: string) {
  return graphFetch<ListResponse<RawPhoto>>(`${albumId}/photos`, {
    fields: "id,images,link,created_time,name",
    limit: "100",
  });
}

export async function fetchPagePhotos() {
  const { pageId } = getConfig();
  if (!pageId) {
    return { ok: false as const, error: "FACEBOOK_PAGE_ID is not set." };
  }

  return graphFetch<ListResponse<RawPhoto>>(`${pageId}/photos`, {
    type: "uploaded",
    fields: "id,images,link,created_time,name",
    limit: "50",
  });
}

export function pickBestImageSource(photo: RawPhoto): string | null {
  const imgs = photo.images;
  if (!imgs?.length) return null;
  const sorted = [...imgs].sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0),
  );
  return sorted[0]?.source ?? null;
}

export function pickCoverSource(album: RawAlbum): string | null {
  const imgs = album.cover_photo?.images;
  if (!imgs?.length) return null;
  return imgs[imgs.length - 1]?.source ?? imgs[0]?.source ?? null;
}
