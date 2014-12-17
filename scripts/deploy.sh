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
REGION=eu-west-1
S3_HOSTED_ZONE_ID=Z1BKCTXD74EZPE

TMP_CONFIG_JS=/tmp/config.js.$$
TMP_INDEX_HTML=/tmp/index.html.$$
TMP_INPUT_JSON=/tmp/route53-change-resource-record-sets.json.$$

pushd ../app > /dev/null

##### S3 COPY #####

echo "# Copy to S3: LOCAL -> s3://${DOMAIN} ..."

aws s3 mb s3://${DOMAIN}
aws s3 sync . s3://${DOMAIN} --recursive --acl public-read
aws s3 website s3://${DOMAIN} --index-document index.html

##### APP CONFIG #####

echo "# Copy update config.js to S3: config.js -> s3://${DOMAIN}/config.js ..."

cat >${TMP_CONFIG_JS} << EOF
'use strict';
angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://api.alerta.io",
    'client_id'   : "379647311730-h7eh836lg77cbbm2pmh0b66nlb3nnpm8.apps.googleusercontent.com",
    'redirect_url': "http://try.alerta.io/oauth2callback.html"
  });
EOF

aws s3 cp ${TMP_CONFIG_JS} s3://${DOMAIN}/config.js --acl public-read --content-type application/javascript
rm ${TMP_CONFIG_JS}

sed s/@@TRACKING_ID/${GOOGLE_TRACKING_ID}/ index.html >${TMP_INDEX_HTML}
aws s3 cp ${TMP_INDEX_HTML} s3://${DOMAIN}/index.html --acl public-read --content-type text/html
rm ${TMP_INDEX_HTML}

##### Route53 #####

echo "# Alias Record on ROUTE53: http://${DOMAIN} -> http://${DOMAIN}.s3-website-${REGION}.amazonaws.com ..."

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
          "DNSName": "s3-website-${REGION}.amazonaws.com.",
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
