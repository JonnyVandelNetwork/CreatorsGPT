var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AvatarType: () => AvatarType,
  SubscriptionTier: () => SubscriptionTier,
  VideoStatus: () => VideoStatus
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvatarType,
  SubscriptionTier,
  VideoStatus
});
