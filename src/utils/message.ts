const resportUrl =
  'https://open.feishu.cn/open-apis/bot/v2/hook/cb513eed-cdc7-4afd-ba2b-fb788bf2ac07';

const getMessageData = (
  infos: {
    title: string;
    content: string;
  }[],
) => {
  const elements = infos.map((info) => {
    return {
      tag: 'div',
      text: {
        content: `${info.title} : ${info.content}`,
        tag: 'lark_md',
      },
    };
  });
  return {
    msg_type: 'interactive',
    card: {
      config: {
        wide_screen_mode: true,
        enable_forward: true,
      },
      header: {
        template: 'green',
        title: {
          content: 'AI Review',
          tag: 'plain_text',
        },
      },
      elements,
    },
  };
};

export async function sendMdMessage(title: string, message: string) {
  await fetch(resportUrl, {
    method: 'POST',
    body: JSON.stringify({
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true,
          enable_forward: true,
        },
        header: {
          template: 'green',
          title: {
            content: title,
            tag: 'plain_text',
          },
        },
        elements: [
          {
            tag: 'markdown',
            content: message,
          },
        ],
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
