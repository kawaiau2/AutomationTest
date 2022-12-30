echo $3
case $1 in
    cr)
        case $2 in
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
                suite="npm run "$2
                ;;
        esac
        echo $suite
        docker build -t autotest .
        docker images
        docker run -d --name autotest$3 --mount type=bind,source="$(pwd)"/result,target=/apiTest/result --mount type=bind,source="$(pwd)"/data,target=/apiTest/data --mount type=bind,source="$(pwd)"/cert,target=/apiTest/cert --mount type=bind,source="$(pwd)"/common,target=/apiTest/common -e runtest="$suite" autotest && docker logs -f autotest$3
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
        docker restart autotest
        docker exec -d autotest $2
        ;;
    restart)
        docker restart autotest && docker logs -f autotest
        ;;
    *)
        echo "invalid input!!"
        ;;
esac