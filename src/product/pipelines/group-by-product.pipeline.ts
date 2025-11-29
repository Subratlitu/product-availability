export const GroupByProductPipeline = [
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
    },
  },
];
