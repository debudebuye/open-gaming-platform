# trading-api

Service responsible for trading features (orders, matching, settlement) once traffic/needs justify heavier scaling.

Startup phase guidance:
- Avoid premature microservice extraction.
- Implement the minimal vertical slice first; measure bottlenecks later.
