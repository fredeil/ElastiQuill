import _ from "lodash";
import fs from "fs";
import path from "path";
import jsYaml from "js-yaml";
import { EmailString } from "./util";

require("dotenv").config();

export const config = initConfig();

function initConfig() {
  let configPath = process.env.CONFIG_PATH || "/etc/elastiquill/config.yml";
  if (process.env.CONFIG_PATH) {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(__dirname, configPath);
    }
  }

  const configFile = fs.readFileSync(configPath, "utf-8");
  console.log("Loading config from " + configPath);
  let config = jsYaml.load(configFile);

  const envOverrides = [
    ["elasticsearch.hosts", "ELASTICSEARCH_HOSTS", "localhost:9200"],
    ["elasticsearch.blog-index-name", "BLOG_POSTS_INDEX", "blog-posts"],
    [
      "elasticsearch.blog-comments-index-name",
      "BLOG_COMMENTS_INDEX",
      "blog-comments",
    ],
    ["elasticsearch.blog-logs-index-name", "BLOG_LOGS_INDEX", "blog-logs"],
    ["elasticsearch.blog-logs-period", "BLOG_LOGS_PERIOD", "daily"],
    ["blog.comments-noreply-email", "BLOG_COMMENTS_NOREPLY_EMAIL"],
    ["blog.comments-post-period", "BLOG_COMMENTS_POST_PERIOD", 60],
    ["blog.title", "BLOG_TITLE", "Sample blog"],
    ["blog.description", "BLOG_DESCRIPTION", "Sample description"],
    ["blog.url", "BLOG_URL", "http://localhost:5000"],
    ["blog.compression", "BLOG_COMPRESSION", false],
    ["blog.cache-ttl", "BLOG_CACHE_TTL", 60],
    ["blog.port", "PORT", "5000"],
    ["blog.admin-emails", "BLOG_ADMIN_EMAILS"],
    ["blog.publisher-emails", "BLOG_PUBLISHER_EMAILS"],
    ["blog.contact-email", "CONTACT_FORM_SEND_TO"],
    ["blog.theme-path", "BLOG_THEME_PATH"],
    ["blog.theme-caching", "BLOG_THEME_CACHING", true],
    ["blog.routing-table-path", "BLOG_ROUTING_TABLE_PATH"],
    ["blog.jwt-secret", "BLOG_JWT_SECRET"],
    ["blog.blog-route-prefix", "BLOG_ROUTE_PREFIX", "/blog"],
    ["blog.admin-route", "ADMIN_ROUTE", "/admin"],
    ["blog.admin-frontend-path", "ADMIN_FRONTEND_PATH", "./build"],
    ["blog.uploads-bucket-prefix", "UPLOADS_BUCKET_PREFIX", ""],
    [
      "blog.default-header-image",
      "DEFAULT_HEADER_IMAGE",
      "/static/base/img/default.jpg",
    ],
    ["credentials.google.analytics-code", "GOOGLE_ANALYTICS_CODE"],
    ["credentials.google.oauth-client-id", "GOOGLE_OAUTH_CLIENT_ID"],
    ["credentials.google.oauth-client-secret", "GOOGLE_OAUTH_CLIENT_SECRET"],
    ["credentials.github.oauth-client-id", "GITHUB_CLIENT_ID"],
    ["credentials.github.oauth-client-secret", "GITHUB_CLIENT_SECRET"],
    ["credentials.google.recaptcha-v2-key", "GOOGLE_RECAPTCHA_V2_CLIENT_KEY"],
    [
      "credentials.google.recaptcha-v2-secret",
      "GOOGLE_RECAPTCHA_V2_SECRET_KEY",
    ],
    ["credentials.google.gcs-bucket", "GOOGLE_GCS_BUCKET"],
    ["credentials.google.gcs-keyfile", "GOOGLE_APPLICATION_CREDENTIALS"],
    ["credentials.aws.s3-bucket", "AWS_S3_BUCKET"],
    ["credentials.aws.access-key-id", "AWS_ACCESS_KEY_ID"],
    ["credentials.aws.secret-access-key", "AWS_SECRET_ACCESS_KEY"],
    ["credentials.akismet.api-key", "AKISMET_APIKEY"],
    ["credentials.akismet.domain", "AKISMET_DOMAIN"],
    ["credentials.sendgrid", "SENDGRID_API_KEY"],
    ["credentials.medium", "MEDIUM_API_KEY"],
    ["credentials.twitter.consumer-key", "TWITTER_CONSUMER_KEY"],
    ["credentials.twitter.consumer-secret", "TWITTER_CONSUMER_SECRET"],
    ["credentials.twitter.access-token-key", "TWITTER_ACCESS_TOKEN_KEY"],
    ["credentials.twitter.access-token-secret", "TWITTER_ACCESS_TOKEN_SECRET"],
    ["credentials.linkedin.client-id", "LINKEDIN_CLIENT_ID"],
    ["credentials.linkedin.client-secret", "LINKEDIN_CLIENT_SECRET"],
    ["credentials.reddit.client-id", "REDDIT_CLIENT_ID"],
    ["credentials.reddit.client-secret", "REDDIT_CLIENT_SECRET"],
    ["credentials.medium.client-id", "MEDIUM_CLIENT_ID"],
    ["credentials.medium.client-secret", "MEDIUM_CLIENT_SECRET"],
    ["credentials.facebook.app-id", "FACEBOOK_APP_ID"],
  ];

  envOverrides.forEach(override => {
    const [configPath, env, defaultValue] = override;
    if (env && !_.isUndefined(_.get(process.env, env))) {
      config = _.set(config, configPath, _.get(process.env, env));
    }

    if (defaultValue && _.isUndefined(_.get(config, configPath))) {
      config = _.set(config, configPath, defaultValue);
    }
  });

  config.blog["admin-emails"] = new EmailString(config.blog["admin-emails"]);
  config.blog["publisher-emails"] = new EmailString(
    config.blog["publisher-emails"]
  );

  config.blog["blog-route-prefix"] = _.trimEnd(
    config.blog["blog-route-prefix"],
    "/"
  );
  const adminRoute = _.trimEnd(config.blog["admin-route"], "/");
  if (!adminRoute.length) {
    throw new Error(`Invalid admin route: "${config.blog["admin-route"]}"`);
  }
  config.blog["blog.admin-route"] = adminRoute;

  return config;
}