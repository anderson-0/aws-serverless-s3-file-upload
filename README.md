# AWS Serverless
A serverless app that is hosted on Amazon AWS Lambda and stores data on DynamoDB and S3

## Amazon AWS Settings
* Sign Up to Amazon AWS using their 1-year free tier
* On AWS, go to the IAM service 
  * Create a new user 
  * For "AWS credential type", make sure to select at least "Access key - Programmatic access"
  * In the Permissions screen, just to configure this example faster give the "AdministratorAccess" permissions. Either create a group to attach permissions and add your user or give your user this permissions directly. But for real scenarios, check the permissions needed. Never give full admin permissions if that is not needed.
  * Copy both "Access key ID" and "Secret access key" to the corresponding keys in your .env file
* Go to the S3 service and click to create a bucket
  * The name must be unique in all amazon aws
  * Select the region closest to you to reduce any network delays and TAKE note of that because after 1 year you will start being charged if you did not delete your things.
  * *For this example*, uncheck the checkbox "Block all public access" to allow public access to your bucket
  * Click on "Create Bucket"
  * Save the name of the bucket and region chosen in the .env file corresponding key
* On your terminal type:
  ```
    serverless config credentials --provider aws --key=<your_access_key_id> --secret=<your_secret_access_key> -o
  ```

## Installation
```
yarn
```

# Serverless Deploy
On your terminal type:
```
  yarn deploy
```
This process might take a quite some time.
Once your deploy is finished you should receive in your terminal the URLs to call your serverless functions

## AWS Lambda
Once the deploy is finished you can check your function at 
https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions

Also, a bucket on AWS S3 will be created with the prefix osf-serverless-certificate.

In case you had no errors during the deploy and your code is not there, check other AWS Regions

# Running the Application Locally
In the .env file there is a flag to decide if you want to use the in memory DynamoDB instance or not. 
If it is TRUE, it will use the local DynamoDB

Open a terminal and run:
```
yarn dynamo:start
```

Obs: It might take a few seconds for the local DynamoDB shell on localhost to be up. 


Open another terminal and run:
```
yarn dev
```

# Routes
Check the insomnia file in the project for routes to call the application both locally and on aws. Just remember to replace the production ones with the ones received after the deploy finished