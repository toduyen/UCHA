docker-compose -f docker-compose.build.yml build &&
docker tag comit_admin/comit-admin thanhtungtvg95/comit-admin &&
docker push thanhtungtvg95/comit-admin &&
docker rmi comit_admin/comit-admin thanhtungtvg95/comit-admin