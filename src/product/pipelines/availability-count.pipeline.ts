export const AvailabilityCountPipeline = [
  {
    $group: {
      _id: "$vendor",
      total: { $sum: 1 },
      available: {
        $sum: {
          $cond: [
            { $in: ["$availability", ["IN_STOCK", "AVAILABLE", "YES", "true", true]] },
            1,
            0,
          ],
        },
      },
    },
  },
  { $sort: { available: -1 } },
];
