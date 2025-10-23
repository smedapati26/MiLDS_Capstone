This is the instrcutions for running the MiLDS Griffin and AMAP containers. Currently the containers are empty.
These continers will serve as spaces to put the app and databases into for the future. 

In between SSH of Griffin and AMAP you will need to run: ssh-keygen -R [localhost]:2222


MiLDS Container:
	In order to run the MiLDS Container you will need the image, and to run this sequence of commands:
		docker build -t imagename -f "path to MiLDS.dockerfile" .
		docker run -it -p 8000:8000 -v .:/app milds-app bash 
	From here you can enter the MiLDS container and run the django app
	
Griffin Container:
	In order to run the Griffin Container you will need the requirements_griffin.txt and the supervisord_griffin.conf.
	Then you need this sequence of commands:
		docker build -t imagename -f "path to Griffin.dockerfile"  .
		docker run -d -p 8000:8000 -p 2222:22 griffin-ssh
		ssh root@localhost -p 2222 (password: passwd)
		
AMAP Container:
	In order to run the AMAP Container you will need the requirements_amap.txt and the supervisord_amap.conf.
	Then you need this sequence of commands:
		docker build -t imagename -f "path to AMAP.dockerfile"  .
		docker run -d -p 8000:8000 -p 2222:22 amap-ssh
		ssh root@localhost -p 2222 (password: passwd)