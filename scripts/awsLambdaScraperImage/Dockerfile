FROM amazonlinux:2

RUN yum update -y && \
    yum install -y \
    amazon-linux-extras \
    shadow-utils \
    unzip \
    curl \
    && yum clean all

RUN amazon-linux-extras install epel -y

RUN amazon-linux-extras install python3.8 -y

RUN yum install -y chromium chromedriver && yum clean all

# Install the AWS Lambda Runtime Interface Client (RIC).
RUN curl -Lo /tmp/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie && \
    install -m 755 /tmp/aws-lambda-rie /usr/local/bin/

# Set up the Python environment using python3.8.
COPY requirements.txt .
RUN python3.8 -m pip install --no-cache-dir awslambdaric && \
    python3.8 -m pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code.
COPY . .

COPY entry.sh /
RUN chmod +x /entry.sh

ENV HANDLER="portion_lambda.lambda_handler"

ENTRYPOINT [ "/entry.sh" ]