/// <reference path="./.sst/platform/config.d.ts" />
import { env } from "process";
export default $config({
  app(input) {
    return {
      name: "aws-bucket-subscriber",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
      providers: {
        aws: {
          region: "ap-south-2",
        },
      },
    };
  },
  async run() {
    const bucket = new sst.aws.Bucket("archive");
    bucket.subscribe({
      handler: "subscriber.handler",
      environment: {
        POCKETBASE_URL: env.POCKETBASE_URL,
        POCKETBASE_EMAIL: env.POCKETBASE_EMAIL,
        POCKETBASE_PASSWORD: env.POCKETBASE_PASSWORD,
        POCKETBASE_COLLECTION: env.POCKETBASE_COLLECTION,
      },
      link: [bucket],
    });

    return {
      bucket: bucket.name,
    };
  },
});
