.PHONY: all generate clean

all: generate

generate:
	@echo "Generating code..."
	java -jar openapi-generator-cli-5.2.0.jar generate -v -i spec/openapi.yaml -c open-api-conf.yaml -g typescript-axios -o ./src/client-axios
	
 