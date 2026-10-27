FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4174
COPY --chown=node:node package.json server.cjs gemini.cjs ./
COPY --chown=node:node public ./public
USER node
EXPOSE 4174
CMD ["node", "server.cjs"]
