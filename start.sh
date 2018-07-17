./stop.sh

rm -rf log.txt

nohup yarn start &> log.txt & echo $! > last.pid
