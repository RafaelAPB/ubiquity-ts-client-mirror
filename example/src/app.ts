import { BlocksApi, Block } from "../../src";

export default function app(): void{


  

    const blockApi = new BlocksApi({
        accessToken: "accessToken"
      });

    blockApi.getBlock(
        "bitcoin",
        "mainnet",
        "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
      ).then((block: Block) => console.log(block));

      blockApi.getBlock(
        "bitcoin",
        "mainnet",
        "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
      ).then((block: Block) => console.log(block));

}
 