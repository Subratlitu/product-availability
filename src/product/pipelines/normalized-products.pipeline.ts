export const NormalizedProductsPipeline = [
  {
    $group: {
      _id: "$productId",
      name: { $first: "$name" },
      vendors: {
        $push: {
          vendor: "$vendor",
          price: "$price",
          availability: "$availability",
        },
      },
      lowestPrice: { $min: "$price" },
    },
  },
  { $sort: { lowestPrice: 1 } },
];
