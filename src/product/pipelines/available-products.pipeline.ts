export const AvailableProductsPipeline = [
  {
    $match: {
      availability: { $in: ["IN_STOCK", "AVAILABLE", "YES", "true", true] },
    },
  },
];
