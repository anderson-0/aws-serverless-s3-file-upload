import * as path from "path";
import {readFileSync} from "fs";
import * as handlebars from "handlebars";
import dayjs from "dayjs";
import {S3} from 'aws-sdk'
import { uuid } from 'uuidv4';
import chromium from "chrome-aws-lambda";
import { document } from "src/utils/dynamodbClient";

interface ICreateCertificateDTO {
    id: string;
    name: string;
    grade: string;
}

interface ITemplate {
    id: string;
    name: string;
    grade: string;
    date: string;
    medal: string;
}

// Generates the certificate using handlebars template engine
const compile = async function(data: ITemplate){
    const filePath = path.join(process.cwd(), "src", "templates", "certificate.hbs")
    const html = readFileSync(filePath,'utf-8');
    
    return handlebars.compile(html)(data);
}

export const handle = async (event) => {
    const {name, grade} = JSON.parse(event.body) as ICreateCertificateDTO;

    const id = uuid();
    // Try to find user in dynamodb
    const response = await document.query({
        TableName: "users_certificates",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userAlreadyExists = response.Items[0];

    // If user does not exist, create it in dynamodb with name and grade
    if (!userAlreadyExists) {
        await document
        .put({
            TableName: "users_certificates",
            Item: {
                id,
                name,
                grade,
            },
        })
        .promise();
    }

    // Gets medal image to add to the certificate
    const medalPath = path.join(process.cwd(), "src", "templates", "medal.png");
    const medal = readFileSync(medalPath, "base64");

    const data: ITemplate = {
        date: dayjs().format("DD/MM/YYYY"),
        grade,
        name,
        id,
        medal
    }

    const content = await compile(data);

    // We use puppeteer to generate the pdf
    const browser = await chromium.puppeteer.launch({
        headless: true,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath
    })

    const page = await browser.newPage();
    
    await page.setContent(content);

    // Generates the pdf locally only if we are not in production
    const pdf = await page.pdf({
        format: "a4",
        landscape: true,
        path: process.env.IS_OFFLINE ? "certificate.pdf" : null,
        printBackground: true,
        preferCSSPageSize: true,
    });

    await browser.close();

    const s3 = new S3();

    // Sends the PDF to S3
    await s3.putObject({
        Bucket:'serverless-osf',
        Key: `${id}.pdf`,
        ACL: 'public-read',
        Body: pdf,
        ContentType: 'application/pdf'
    }).promise()

    return {
        statusCode: 201,
        body: JSON.stringify({
            url: `https://serverless-osf.s3.us-east-1.amazonaws.com/${id}.pdf`
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
}