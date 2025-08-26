#!/bin/sh
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/local/bin/aws-lambda-rie /usr/bin/python3.8 -m awslambdaric.__main__ ${HANDLER}
else
  exec /usr/bin/python3.8 -m awslambdaric.__main__ ${HANDLER}
fi