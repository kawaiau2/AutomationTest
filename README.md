# AutomationTest

### Direct Run
  &nbsp;&nbsp;npm install  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//git pull test script  
  &nbsp;&nbsp;Copy cert and data folder (API SSL cert if required, data files i.e. ./data/{{project name}}/env.postman_environment.json, ./data/{{project name}}/iterationfile.csv, ./data/{{project name}}/{{project name}}.postman_collection.json, ./data/{{project name}}/pageObject.csv, ./data/{{project name}}/{{flow name}}.csv, ./data/{{project name}}/{{submit flow name}}.csv
  &nbsp;&nbsp;npm test  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//i.e. npm --config=./config/{{config name}} --planId={{Plan JIRA Key}} --execId={{Plan JIRA Key}} test  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//i.e. mocha -t 120000  

### Docker command
  &nbsp;&nbsp;./run.sh {{command}} {{container prefix}} {{execution arg}}  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//command:  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cr: build image and run container  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rm: container and image  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ckImg: check image  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ckContainer: check container  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cmd: restart and run command  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;restart: restart  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//container prefix: the container name is autotest{{container prefix}}  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//execution arg: i.e. npm --config=./config/config.json --planId=xxx-100 --execId=xxx-101 test  

### Git
  &nbsp;&nbsp;git init  
  &nbsp;&nbsp;git add --all  
  &nbsp;&nbsp;git commit -m "xxx-xxx Initial Commit"  
  &nbsp;&nbsp;git remote add origin https://{{username}}:{{[Personal access tokens](https://xxx-bitbucket.aiaazure.biz/plugins/servlet/access-tokens/manage "Click here to setup Personal access tokens")}}@aiahk-bitbucket.aiaazure.biz/tribe/automation.git  
  &nbsp;&nbsp;git push -u origin {{branch}}
