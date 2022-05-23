.PHONY: generate generate-local

default_openapi_jar_path = openapi-generator-cli.jar
ifeq "$(OPENAPI_GENERATOR_JAR_PATH)" ""
	openapi_jar_path := $(default_openapi_jar_path)
else
	openapi_jar_path := $(OPENAPI_GENERATOR_JAR_PATH)
endif


.PHONY: generate
generate:
	docker run --rm -v "$$(pwd):/local" \
		--user $(shell id -u):$(shell id -g) \
		openapitools/openapi-generator-cli:v5.2.0 generate \
		-i /local/spec/openapi-v1.yaml \
		-g typescript-axios \
		-o /local/src/generated

.PHONY: generate-local
generate-local:
	@echo "Generating code..."
	java -jar $(openapi_jar_path) generate -v \
		-i spec/openapi-v1.yaml \
		-g typescript-axios \
		-o src/generated