FROM node:20-alpine

RUN apk add --no-cache bash tini
RUN addgroup -S murmur && adduser -S murmur -G murmur

WORKDIR /opt
COPY packages/murmur-cli ./murmur-cli
RUN npm install -g ./murmur-cli

RUN cat > /usr/local/bin/murmur-shell <<'SH'
#!/usr/bin/env bash
set -euo pipefail

echo "MurMur operator shell (restricted)."
echo "Allowed: murmur node spawn <name> | murmur node list | murmur logs tail <nodeId>"
while true; do
  read -r -p "murmur> " cmd args || exit 0
  case "$cmd" in
    murmur)
      murmur $args
      ;;
    exit|quit)
      exit 0
      ;;
    *)
      echo "command not allowed"
      ;;
  esac
done
SH
RUN chmod 0755 /usr/local/bin/murmur-shell

USER murmur
WORKDIR /home/murmur
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bash"]
