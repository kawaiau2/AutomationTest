echo $3
case $1 in
    cr)
        case $3 in
            test)
                suite="npm test"
                ;;
            NULL)
                suite="npm test"
                ;;
            "")
                suite="npm test"
                ;;
            *)
                suite=$3
                ;;
        esac
        echo $suite
        docker build -t autotest .
        docker images
        docker run -d --name autotest$2 --mount type=bind,source="$(pwd)"/result,target=/apiTest/result --mount type=bind,source="$(pwd)"/preRequest,target=/apiTest/preRequest --mount type=bind,source="$(pwd)"/data,target=/apiTest/data --mount type=bind,source="$(pwd)"/config,target=/apiTest/config --mount type=bind,source="$(pwd)"/common,target=/apiTest/common --mount type=bind,source="$(pwd)"/cert,target=/apiTest/cert -e runtest="$suite" autotest && docker logs -f autotest$2
        ;;
    rm)
        docker container rm autotest$2
        docker image rm autotest
        ;;
    ckImg)
        docker images
        ;;
    ckContainer)
        docker container ls -a
        ;;
    cmd)
        docker restart autotest$2
        docker exec -d autotest$2 $3
        ;;
    restart)
        docker restart autotest$2 && docker logs -f autotest$2
        ;;
    *)
        echo "invalid input!!"
        ;;
esac