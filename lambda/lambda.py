import json
import boto3
import re
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    inputJson = json.loads(event["body"])
    responseObject = {}
    responseObject["statusCode"] = 200
    responseObject["headers"] = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    }
    responseObject["headers"]["Content Type"] = "application/json"
    responseObject["body"] = json.dumps(
        {"statusCode": 200, "body": comprehend(inputJson["texto"])}
    )

    return responseObject


def comprehend(t):
    BdyResp = {
        "estado": "ok",
        "positivo": 0,
        "negativo": 0,
        "neutral": 0,
        "mixto": 0,
        "entidades": [],
    }
    t = (
        re.sub(
            r"([0-9]{2}:){2}[0-9]{2}\.[0-9]{3},([0-9]{2}:){2}[0-9]{2}\.[0-9]{3}",
            "",
            t,
        )
        .strip()
        .replace("\n", ".")
        .replace(". .", "\n")
    )

    if not len(t) <= 5000:
        t = t[0:4999]
        BdyResp["estado"] = "La capa gratuita solamente cubre 5000 caracteres"

    try:
        client = boto3.client("comprehend")
        sentiments = client.detect_sentiment(Text=t, LanguageCode="es")
        BdyResp["positivo"] = sentiments["SentimentScore"]["Positive"]
        BdyResp["negativo"] = sentiments["SentimentScore"]["Negative"]
        BdyResp["neutral"] = sentiments["SentimentScore"]["Neutral"]
        BdyResp["mixto"] = sentiments["SentimentScore"]["Mixed"]
        entidades = client.detect_entities(Text=t, LanguageCode="es")
        BdyResp["entidades"] = entidades["Entities"]
    except Exception as e:
        BdyResp["estado"] = "Error al conectar con AWS Comprehend"
        BdyResp["message"] = str(e)

    return BdyResp