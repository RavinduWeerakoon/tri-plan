import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useGetIdentity } from "@refinedev/core";
import { IUser } from "../../utility/interface";
import { supabaseClient } from "../../utility";
import { COLORS } from "../../utility/colors";

function Chat({
  isOpen,
  onClose,
  projectId,
  chats,
  setChats,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId?: any;
  chats: any;
  setChats: any;
}) {
  const { data: user } = useGetIdentity<IUser>();
  const [text, setText] = useState<string>("");
  const chatsWatcher = useRef<any>(null);
  const bottomRef = useRef<any>(null);

  const getAllChats = async () => {
    //filter with project id
    const { data } = await supabaseClient
      .from("chats")
      .select("*")
      .eq("project_id", projectId);

    setChats(data);
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }

    chatsWatcher.current = supabaseClient
      .channel("custom-update-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        () => {
          getAllChats();
        }
      )
      .subscribe();

    getAllChats();

    () => {
      chatsWatcher.current.unsubscribe();
    };
  }, [bottomRef.current]);

  const onChatSend = (e: any) => {
    e.preventDefault();
    if (text?.trim()) {
      const payload = {
        user: user?.email,
        project_id: projectId,
        message: text,
      };

      supabaseClient
        .from("chats")
        .insert(payload)
        .then(() => {
          setText("");
          getAllChats();
        });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
      <ModalOverlay
        bg="none"
        backdropFilter="auto"
        backdropInvert="80%"
        backdropBlur="2px"
      />
      <ModalContent mx="2">
        <ModalHeader> Group Chat </ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH={"70vh"} overflowY={"auto"} overflow={"auto"}>
          {!chats?.length
            ? "Begin chatting"
            : chats?.map((row: any) => {
                return (
                  <Flex
                    key={row.id}
                    direction={"row"}
                    mb={"4"}
                    padding={2}
                    justifyContent={
                      user?.email === row?.user ? "flex-end" : "flex-start"
                    }
                  >
                    <Flex
                      borderTopStartRadius={user?.email === row?.user ? 12 : 4}
                      borderBottomStartRadius={
                        user?.email === row?.user ? 16 : 4
                      }
                      borderTopEndRadius={user?.email === row?.user ? 4 : 16}
                      borderBottomEndRadius={user?.email === row?.user ? 4 : 16}
                      bg={
                        user?.email === row?.user
                          ? COLORS.primaryColor
                          : COLORS.neutral600
                      }
                      width={"fit-content"}
                      maxWidth={"70%"}
                      direction={"column"}
                      padding={2}
                    >
                      <Text fontSize={"md"} color={"white"} borderRadius={4}>
                        {row?.message}
                      </Text>
                      <Text
                        fontSize={"sm"}
                        color={"white"}
                        borderRadius={4}
                        alignSelf={"flex-end"}
                        fontStyle={"italic"}
                      >
                        {row?.user}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
          <div ref={bottomRef}></div>
        </ModalBody>

        <form onSubmit={onChatSend}>
          <ModalFooter gap={"4"}>
            <Input
              placeholder="Type here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="submit"
              background={"black"}
              color={"white"}
              mr={3}
              onClick={onChatSend}
            >
              Send
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default Chat;
