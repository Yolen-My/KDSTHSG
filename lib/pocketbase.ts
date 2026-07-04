import PocketBase from "pocketbase";
import { LANG_HEADER, getStoredLocale } from "@/lib/i18n";

function getPocketBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (envUrl) return envUrl;

  // 浏览器端自动使用当前页面的 hostname，避免 IP 变化导致连接失败
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8090`;
  }

  return "http://localhost:8090";
}

export const pb = new PocketBase(getPocketBaseUrl());

// 全局禁用自动取消，防止轮询请求中断关键操作（如 Bingo 判分）
pb.autoCancellation(false);

// 每个请求自动携带当前语言（默认 zh，可为 en）。
// 服务端 pb_hooks 读取该头，按语言返回对应的题目字段。
pb.beforeSend = function (url, options) {
  const headers = { ...(options.headers || {}) } as Record<string, string>;
  if (!headers[LANG_HEADER]) {
    headers[LANG_HEADER] = getStoredLocale();
  }
  options.headers = headers;
  return { url, options };
};
