// src/index.ts
var AvatarType = /* @__PURE__ */ ((AvatarType2) => {
  AvatarType2["STATIC"] = "static";
  AvatarType2["AI_GENERATED"] = "ai_generated";
  AvatarType2["UPLOADED"] = "uploaded";
  return AvatarType2;
})(AvatarType || {});
var VideoStatus = /* @__PURE__ */ ((VideoStatus2) => {
  VideoStatus2["PENDING"] = "pending";
  VideoStatus2["PROCESSING"] = "processing";
  VideoStatus2["COMPLETED"] = "completed";
  VideoStatus2["FAILED"] = "failed";
  return VideoStatus2;
})(VideoStatus || {});
var SubscriptionTier = /* @__PURE__ */ ((SubscriptionTier2) => {
  SubscriptionTier2["FREE"] = "free";
  SubscriptionTier2["BASIC"] = "basic";
  SubscriptionTier2["PREMIUM"] = "premium";
  SubscriptionTier2["ENTERPRISE"] = "enterprise";
  return SubscriptionTier2;
})(SubscriptionTier || {});
export {
  AvatarType,
  SubscriptionTier,
  VideoStatus
};
