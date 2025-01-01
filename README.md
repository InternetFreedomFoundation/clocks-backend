# Clocks-Backend

This repo serves as the backend for [Clocks](https://github.com/InternetFreedomFoundation/Clocks).

An S3 bucket will be created with a lambda function that gets triggered on every file upload (async). Metadata is extracted from the uploaded file and a new record is created using pocketbase API's.

![backend](./backend.svg)