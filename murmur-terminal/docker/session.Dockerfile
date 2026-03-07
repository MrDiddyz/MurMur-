FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash tini ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 10001 murmur
WORKDIR /opt/murmur

COPY packages/murmur-cli /opt/murmur-cli
RUN ln -s /opt/murmur-cli/src/index.js /usr/local/bin/murmur \
  && chmod +x /opt/murmur-cli/src/index.js

USER murmur
ENV PATH="/usr/local/bin:${PATH}"
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bash"]
