"use server";

import {
  fetchAlbumPhotos,
  fetchPageAlbums,
  fetchPagePhotos,
  isFacebookGalleryConfigured,
  pickBestImageSource,
  pickCoverSource,
  type RawAlbum,
  type RawPhoto,
} from "@/lib/facebook/graph";

export type AlbumSummary = {
  id: string;
  name: string;
  description: string | null;
  createdTime: string | null;
  photoCount: number | null;
  coverUrl: string | null;
  link: string | null;
};

export type PhotoItem = {
  id: string;
  src: string;
  link: string | null;
  createdTime: string | null;
  caption: string | null;
};

function mapAlbum(a: RawAlbum): AlbumSummary {
  return {
    id: a.id,
    name: a.name?.trim() || `Album ${a.id}`,
    description: a.description?.trim() ?? null,
    createdTime: a.created_time ?? null,
    photoCount: typeof a.count === "number" ? a.count : null,
    coverUrl: pickCoverSource(a),
    link: a.link ?? null,
  };
}

function mapPhoto(p: RawPhoto): PhotoItem | null {
  const src = pickBestImageSource(p);
  if (!src) return null;
  return {
    id: p.id,
    src,
    link: p.link ?? null,
    createdTime: p.created_time ?? null,
    caption: p.name?.trim() ?? null,
  };
}

/**
 * Lists Page photo albums (each can represent a "project" on the Facebook Page).
 */
export async function listFacebookAlbums(): Promise<{
  configured: boolean;
  albums: AlbumSummary[];
  error: string | null;
}> {
  if (!isFacebookGalleryConfigured()) {
    return {
      configured: false,
      albums: [],
      error: null,
    };
  }

  const res = await fetchPageAlbums();
  if (!res.ok) {
    return { configured: true, albums: [], error: res.error };
  }

  const data = res.data.data ?? [];
  return {
    configured: true,
    albums: data.map(mapAlbum),
    error: null,
  };
}

/**
 * Loads all photos for one album (project).
 */
export async function getFacebookAlbumPhotos(albumId: string): Promise<{
  photos: PhotoItem[];
  error: string | null;
}> {
  if (!isFacebookGalleryConfigured()) {
    return { photos: [], error: "Facebook is not configured." };
  }

  const res = await fetchAlbumPhotos(albumId);
  if (!res.ok) {
    return { photos: [], error: res.error };
  }

  const raw = res.data.data ?? [];
  const photos = raw.map(mapPhoto).filter((p): p is PhotoItem => p !== null);
  return { photos, error: null };
}

/**
 * Fallback: uploaded photos on the Page (no album grouping).
 */
export async function listFacebookPagePhotos(): Promise<{
  photos: PhotoItem[];
  error: string | null;
}> {
  if (!isFacebookGalleryConfigured()) {
    return { photos: [], error: null };
  }

  const res = await fetchPagePhotos();
  if (!res.ok) {
    return { photos: [], error: res.error };
  }

  const raw = res.data.data ?? [];
  const photos = raw.map(mapPhoto).filter((p): p is PhotoItem => p !== null);
  return { photos, error: null };
}
