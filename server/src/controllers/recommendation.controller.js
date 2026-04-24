import { getRecommendations } from "../services/recommendationService.js";

export const recommendationsHandler = async (_req, res) => {
  try {
    const data = await getRecommendations();
    return res.status(200).json(data);
  } catch (_error) {
    return res.status(200).json({
      recommendations: [
        "Encrypt password column.",
        "Reduce null values in critical fields.",
        "Add uniqueness constraints on key identifiers.",
      ],
    });
  }
};
