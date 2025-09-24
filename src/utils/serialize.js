export function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
export const attachFullImageUrl = (
  pictogram,
  host = "http://localhost:3000"
) => {
  if (!pictogram) return null;

  const newPicto = { ...pictogram };
  if (pictogram.image?.url) {
    newPicto.image = {
      ...pictogram.image,
      fullUrl: `${host}${pictogram.image.url}`,
    };
  }
  return newPicto;
};

export const attachFullImageUrlArray = (
  pictograms,
  host = "http://localhost:3000"
) => pictograms.map((p) => attachFullImageUrl(p, host));
