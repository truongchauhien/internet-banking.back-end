# Docker Containers
docker container start MySQL rabbitmq
## RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=root -e RABBITMQ_DEFAULT_PASS=Th3B3stP@ssw0rd3v3r rabbitmq:3-management
## MySQL
docker run --name MySQL --publish 3306:3306 -e MYSQL_ROOT_PASSWORD=Th3B3stP@ssw0rd3v3r -d mysql:latest --default-authentication-plugin=mysql_native_password