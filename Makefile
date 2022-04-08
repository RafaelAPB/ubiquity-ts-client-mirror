
.PHONY: generate
generate:
	docker run --rm -v "$$(pwd):/local" \
		--user $(shell id -u):$(shell id -g) \
		openapitools/openapi-generator-cli:v5.2.0 generate \
		-i /local/spec/openapi-v1.yaml \
		-g typescript-axios \
		-o /local/src/generated
