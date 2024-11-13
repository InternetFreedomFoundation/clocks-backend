import { Handler, S3Event } from "aws-lambda";
import PocketBase from "pocketbase";
import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import * as cheerio from "cheerio";

const pb = new PocketBase(process.env.POCKETBASE_URL);
const adminData = await pb
  .collection("API_ACCESS")
  .authWithPassword(
    process.env.POCKETBASE_EMAIL,
    process.env.POCKETBASE_PASSWORD,
  );

const client = new S3({});

export const handler: Handler<S3Event> = async (event: S3Event) => {
  try {
    console.dir(event);

    const s3_record = event.Records[0];
    const bucket = s3_record.s3.bucket.name;
    const filename = decodeURIComponent(
      s3_record.s3.object.key.replace(/\+/g, " "),
    );

    const htmlFile = await getFileFromS3(bucket, filename);
    const fullUrl = await parseHTML(htmlFile);

    console.log(`New file uploaded: ${filename}`);

    const parts = filename.split(".");
    const name = parts.slice(0, -1).join(".");
    const extension = parts[-1];
    console.log(`Name: ${name}, Extension: ${extension}`);

    const record = await pb
      .collection(process.env.POCKETBASE_COLLECTION)
      .create({
        Title: name,
        URL: fullUrl,
        Key: filename,
      });

    console.log(record.created);

    return "ok";
  } catch (error) {
    console.error("Error processing S3 event:", error);
    throw error;
  }
};
async function getFileFromS3(bucket: string, key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    console.log(`Getting file from S3: ${bucket}/${key}`);
    const response = await client.send(command);

    return await response.Body.transformToString();
  } catch (error) {
    console.error("Error getting file from S3:", error);
    throw new Error(`Failed to get file from S3: ${error.message}`);
  }
}
function parseHTML(htmlFile: string): string {
  try {
    const $ = cheerio.load(htmlFile);
    const url = $(".infobar-link-icon").attr("href");

    if (!url) {
      throw new Error("URL not found in HTML");
    }

    return url;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    throw new Error(`Failed to parse HTML: ${error.message}`);
  }
}
