import type { NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { MongoChatItem } from '@fastgpt/service/core/chat/chatItemSchema';
import { type DelHistoryProps } from '@/global/core/chat/api';
import { authChatCrud } from '@/service/support/permission/auth/chat';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { type ApiRequestProps } from '@fastgpt/service/type/next';
import { deleteChatFiles } from '@fastgpt/service/core/chat/controller';
import { MongoChatItemResData } from '@fastgpt/service/core/chat/chatItemResDataSchema';

/* clear chat history */
async function handler(req: ApiRequestProps<{}, DelHistoryProps>, res: NextApiResponse) {
  const { appId, chatId } = req.query;

  await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.query
  });

  await deleteChatFiles({ chatIdList: [chatId] });
  await mongoSessionRun(async (session) => {
    await MongoChatItemResData.deleteMany(
      {
        appId,
        chatId
      },
      { session }
    );
    await MongoChatItem.deleteMany(
      {
        appId,
        chatId
      },
      { session }
    );
    await MongoChat.deleteOne(
      {
        appId,
        chatId
      },
      { session }
    );
  });

  jsonRes(res);
}

export default NextAPI(handler);
