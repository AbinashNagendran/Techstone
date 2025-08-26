This directory is for making the docker image for aws Lambda. Since web scraping requires Chrome and lots of dependencies, AWS Lambda can't do it 
out of the box. So we provide a docker container image, NOTE build the image with LEGACY BUILDER 
like  $env:DOCKER_BUILDKIT=0; docker build ... then push to Amazon Elastic Container Registry priviate repository.

Then your aws Lambda should be able to use it, make sure to config memory to 2048 MB and make ENV variables required for your DB

The whole docker package was done by AbinashNagenran and Akkipr
