"""Helpers for URLs returned to clients (browsers, devices)."""

from aiohttp import web

from supernote.server.config import ServerConfig


def public_base_url(request: web.Request) -> str:
    """Public origin for signed upload/download URLs.

    Prefer SUPERNOTE_BASE_URL when set so responses work behind reverse proxies.
    Otherwise use the request origin (after any configured forwarded-header middleware).
    """
    config: ServerConfig = request.app["config"]
    if config._base_url:
        return config._base_url.rstrip("/")
    return f"{request.scheme}://{request.host}".rstrip("/")
