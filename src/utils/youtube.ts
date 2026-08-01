/** Miniatura YouTube fiable (maxresdefault suele devolver placeholder minúsculo). */
export function youtubeThumbnailUrl(
  videoId: string,
  quality: "sddefault" | "hqdefault" = "sddefault",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string, autoplay = false): string {
  const params = autoplay ? "?autoplay=1&rel=0" : "?rel=0";
  return `https://www.youtube-nocookie.com/embed/${videoId}${params}`;
}
