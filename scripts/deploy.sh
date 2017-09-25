#!/bin/bash

# Usage: deploy.sh

if [[ "$1" =~ ^(\-\?|\-h)$ ]]
then
  echo "Usage: deploy.sh"
  exit 1
fi

HOSTED_ZONE_ID=Z2RNJ4H6FV67LG
DOMAIN=try.alerta.io
GOOGLE_TRACKING_ID=UA-44644195-1
OAUTH2_CLIENT_ID=736147134702-glkb1pesv716j1utg4llg7c3rr7nnhli.apps.googleusercontent.com
S3_HOSTED_ZONE_ID=Z1BKCTXD74EZPE
AWS_DEFAULT_REGION=eu-west-1
export AWS_DEFAULT_REGION

TMP_CONFIG_JS=/tmp/config.js.$$
TMP_INDEX_HTML=/tmp/index.html.$$
TMP_INPUT_JSON=/tmp/route53-change-resource-record-sets.json.$$

pushd ../app > /dev/null

##### S3 COPY #####

echo "# Copy to S3: LOCAL -> s3://${DOMAIN} ..."

aws s3 mb s3://${DOMAIN}
aws s3 sync . s3://${DOMAIN} --acl public-read
aws s3 website s3://${DOMAIN} --index-document index.html

##### APP CONFIG #####

echo "# Copy update config.js to S3: config.js -> s3://${DOMAIN}/config.js ..."

cat >${TMP_CONFIG_JS} << EOF
'use strict';
angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://alerta-api.herokuapp.com",
    'provider'    : "google",
    'client_id'   : "${OAUTH2_CLIENT_ID}",
    'tracking_id' : "${GOOGLE_TRACKING_ID}"
  });
EOF

aws s3 cp ${TMP_CONFIG_JS} s3://${DOMAIN}/config.js --acl public-read --content-type application/javascript
rm ${TMP_CONFIG_JS}

##### Route53 #####

echo "# Alias Record on ROUTE53: http://${DOMAIN} -> http://${DOMAIN}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com ..."

cat >${TMP_INPUT_JSON} << EOF
{
  "Comment": "Alerta explorer",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${DOMAIN}",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "${S3_HOSTED_ZONE_ID}",
          "DNSName": "s3-website-${AWS_DEFAULT_REGION}.amazonaws.com.",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id ${HOSTED_ZONE_ID} --change-batch file://${TMP_INPUT_JSON}
rm ${TMP_INPUT_JSON}

popd > /dev/null

echo "# Done."
