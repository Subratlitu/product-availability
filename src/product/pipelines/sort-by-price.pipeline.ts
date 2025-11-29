export const SortByPricePipeline = [
  { $match: { price: { $gt: 0 } } },
  { $sort: { price: 1 } },
];
