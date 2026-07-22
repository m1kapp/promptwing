"use client";

import { useEffect, useRef } from "react";

/**
 * 참고 이미지들을 미리 fetch 하여 PNG Blob으로 캐시한다.
 * 반환된 ref.current(Map<index, Blob>)는 복사 시 즉시 사용된다.
 */
export function useReferenceImageBlobs(referenceImages?: { url: string; label: string }[]) {
  const blobs = useRef<Map<number, Blob>>(new Map());

  useEffect(() => {
    if (!referenceImages) return;
    referenceImages.forEach((ref, idx) => {
      fetch(ref.url)
        .then((res) => res.blob())
        .then((blob) => {
          const canvas = document.createElement("canvas");
          const img = new window.Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d")?.drawImage(img, 0, 0);
            canvas.toBlob((pngBlob) => {
              if (pngBlob) blobs.current.set(idx, pngBlob);
            }, "image/png");
          };
          img.src = URL.createObjectURL(blob);
        })
        .catch(() => {});
    });
  }, [referenceImages]);

  return blobs;
}
