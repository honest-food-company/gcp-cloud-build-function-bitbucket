# Cloud Build Status to Bitbucket

## Keywords

Google Cloud Platform (GCP),
Cloud Build, Pub/Sub, Cloud Functions, Bitbucket

## Description

This Code should be used as a GCP Cloud Function,<br>
which is triggered by the Pub/Sub (topic *cloud-builds*).<br>
When ever Cloud Build runs, the status will be pushed to Bitbucket.

## Setup

* Setup a GCP Cloud Build Trigger for your Bitbucket repository
* Create a GCP Cloud Functions Function
  * Set the Pub/Sub topic **cloud-builds** as trigger
  * Set **Node.js 8** as runtime
  * Set **Function to execute** to **processPubSubMessage**
  * Define the **BITBUCKET_TOKEN** environment variable (under *More*)