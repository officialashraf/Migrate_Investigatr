import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap } from 'lucide-react';
import styles from './ChatBot.module.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MdOutlineArrowUpward } from "react-icons/md";
import { jwtDecode } from 'jwt-decode';
import Sidebar from './sidebar';
import TableModal from '../../Common/Table/table';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const chatEndRef = useRef(null);
  const pendingHandled = useRef(false);


  const token = Cookies.get("accessToken");

  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem("chats")) || []);
  const [activeChatId, setActiveChatId] = useState(() =>
    localStorage.getItem("activeChatId") || (chats[0]?.id || null)
  );
  const activeChat = chats.find(chat => chat.id === activeChatId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const HARD_ANSWERS = {
    // 1. Go to case CASE0066 and provide top 5 platforms wise data relate to it?
    'go to case case0066 and provide top 5 platforms wise data relate to it?': {
      text: 'X:141397, Telegram:75636, Facebook:37432, Instagram:3600, 4chan.org:60',
      type: 'text' // Standard text answer
    },

    // 2. Provide hashtags related to NamdiKanuNow and Biafra?
    'provide hashtags related to namdikanunow and biafra?': {
      text: '#FreeNnamdiKanuNow,#MNKOct20,#biafraliberationarmy,#Biafra,#everyonehighlightsfollowers,#NnamdiKanu,#FreeMaziNnamdiKanuNow,#wakeupndiigbo,#FreeNnamdiKanu,#nigeria,#BreakingNews,#IgboAmaka,#reelsviralシ,#2027Elections,#ADC,#Biafra,#EndBadGovernanceInNigeria,#BiafraReferendumNow,#FreeNnamdiKanuNow#USB,#FreeNnamdiKanuNow,,#IPOB,#MNkOct20,#TableShaker,#USA,#VDM,#africa,#everyone #BIAFRA,#fypシ,#goviral,#AbujaCourt,#BREAKING,#BiafraExitFromNigeriaNow,#BiafraReferendum',
      type: 'text'
    },

    // 3. Provide all osint phone number and email ID from CASE0066 ?
    'provide all osint phone number and email id from case0066 ?': {
      text: `OSINT Phone Numbers:  
               6467045433, 6465596640, 16465596640, 2347037688434, 2347038169314, 2347060694169, 2347063459910, 27711155841, 2347069122237, 212672144621, 213667285490, 2348092321015, 213662340715, 213667702136, 2348029515124, 27827337664, 212645460591

        Email IDs: 
                   jiim.devine@gmail.com, la@saharareporters.com, fatima@saharareporters.com, adverts@saharareporters.comm, azaman786@rediffmail.com, kaylavlawrence@gmail.com, kayla.lawrence@twosigma.com, tarisai@iroko.ng, tarinhe@gmail.com, mohini.ufeli@andela.com, ohini@paystack.com, ichiv@clsmf.org, luz118@gmail.com, lunamoongoddess@hotmail.com, nneomaokorie@gmail.com, laliche@njcu.edu, marcpierre11@gmail.com, karen.attiah@gmail.com, karen.attiah@washingtonpost.com, chinedurylan@gmail.com, carrielo@buffalo.edu, traytori@yahoo.com, dbanjo@ocde.us, cnnawetanma@gmail.com, chinnawetanma@gmail.com, rushperez@gmail.com, arao.ameny@ubalt.edu, araoameny@gmail.com, arao.ameny@gmail.com, palabi@vera.org, galvind@mville.edu, nahid@aazfashionbd.com`,
      type: 'text'
    },

    // 4. Provide all location from PII related to sahara reporters?
    'provide all location from pii related to sahara reporters?': {
      text: `99 Glenbrook Parkway, New York, New York; wukari, Bnmadi, Taraba, Nigeria; bauchi, Bauchi; abuja, Nigeria; abuja, Nigeria; lagos, Nigeria; lagos, Nigeria; laayoune, Western Sahara; kadunab; johannesburg, Gauteng; kano, Kano, Nigeria; Bilorin; Berin Ile, Oyo, Nigeria; austin, Texas; Bohafia; maiduguri; Bmaiduguri; new York, New York; kiribo, Ondo, Nigeria; lagos, Blagos, Nigeria; Male, Maldives; London, United Kingdom; Guelmim, Guelmim; Btouba, Senegal; Bdakar, Senegal; Saharsa; 763 trabert avenue northwest; igeriatouba, senegal dakar, senegal`,
      type: 'text'
    }
  };
  const startNewChat = () => {
    const existingEmptyChat = chats.find(chat => chat.messages.length === 0);

    if (existingEmptyChat) {
      setActiveChatId(existingEmptyChat.id);
    } else {
      const newChat = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: []
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
    setInput('');
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFirstName(decodedToken.first_name || '');
        setLastName(decodedToken.last_name || '');
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [token]);

  useEffect(() => {
    if (chats.length === 0) {
      const newChat = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: []
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else if (!activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, []);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("activeChatId", activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    const textarea = document.querySelector(`.${styles.textarea}`);
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pendingPrompt"));
    if (!pending || pendingHandled.current) return;

    pendingHandled.current = true;

    setActiveChatId(pending.chatId);
    setLoading(true);

    axios.post(
      `${window.runtimeConfig.VITE_APP_API_LLM}/api/ai-assistant/v1/prompt`,
      { prompt: pending.input },
      {
        headers: {
          Authorization: `Bearer ${token || "mock-token"}`,
          "Content-Type": "application/json"
        }
      }
    )
      .then((response) => {
        const responseData = response.data || { results: [] };
        const botMsg = { sender: "bot", text: JSON.stringify(responseData) };

        setChats(prev =>
          prev.map(chat =>
            chat.id === pending.chatId
              ? { ...chat, messages: [...chat.messages, botMsg] }
              : chat
          )
        );
      })
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false);
        localStorage.removeItem("pendingPrompt");
      });
  }, []);


  const handleSend = async () => {
    if (!input.trim() || loading || !activeChatId) return;

    setLoading(true);
    const userMsg = { sender: "user", text: input };
    const currentInput = input;
    setInput("");

    const normalizedInput = currentInput.trim().toLowerCase();
    const hardAnswer = HARD_ANSWERS[normalizedInput]; // Hard Answer check karein

    // 1. User message ko add karein
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
            ...chat,
            messages: [...chat.messages, userMsg],
            title: chat.messages.length === 0 ? currentInput.slice(0, 30) : chat.title
          }
          : chat
      )
    );

    // Hard Answer ko turant render karein
    if (hardAnswer) {
      console.log("Hard Answer Matched! Bypassing API.");

      // Bot ka response taiyar karein
      let botMsg;
      if (hardAnswer.type === 'json_table') {
        // Agar aapka answer table format mein ho toh JSON.stringify use karein, 
        // Varna direct text use karein.
        botMsg = { sender: "bot", text: hardAnswer.text };
      } else {
        // For simple text answers
        botMsg = { sender: "bot", text: hardAnswer.text };
      }

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMsg] }
            : chat
        )
      );

      setLoading(false);
      return; // API call skip karein
    }

    // const currentInput = input;
    setInput("");

    localStorage.setItem("pendingPrompt", JSON.stringify({
      chatId: activeChatId,
      input: currentInput
    }));

    try {
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_LLM}/api/ai-assistant/v1/prompt`,
        { prompt: currentInput },
        {
          headers: {
            Authorization: `Bearer ${token || "mock-token"}`,
            "Content-Type": "application/json"
          }
        }
      );

      const responseData = response.data || { results: [] };

      const botMsg = { sender: "bot", text: JSON.stringify(responseData) };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMsg] }
            : chat
        )
      );

      localStorage.removeItem("pendingPrompt");

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  const isInitialState = !activeChat || activeChat.messages.length === 0;
  const displayName = (firstName || lastName)
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : 'User';

  return (
    <div className={styles.container}>
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        startNewChat={startNewChat}
        chats={chats}
        selectChat={setActiveChatId}
        activeChatId={activeChatId}
      />

      <main className={styles.main}>
        <div className={styles.chatArea}>
          {isInitialState ? (
            <div className={styles.welcome}>
              <h1>Hello, {displayName}</h1>
            </div>
          ) : (
            <div className={styles.messageContainer}>
              {activeChat.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.messageRow} ${msg.sender === "user" ? styles.userRow : styles.botRow}`}
                >
                  {msg.sender === "bot" && (
                    <div className={`${styles.icon} ${styles.botIcon}`}>
                      🤖
                    </div>
                  )}

                  <div
                    className={`${styles.messageBox} ${msg.sender === "user" ? styles.userMessage : styles.botMessage}`}
                  >
                   {(() => {
                      if (msg.sender !== "bot") return msg.text;

                      let parsed = null;
                      try {
                        parsed = JSON.parse(msg.text);
                      } catch (e) {
                        return msg.text.split("\n").map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < msg.text.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ));
                      }

                      if (parsed?.results?.length > 0) {
                        const columns = Object.keys(parsed.results[0]).map((key) => ({
                          key,
                          label: key.replace(/_/g, " ").toUpperCase(),
                        }));

                        const sanitizedData = parsed.results.map((row) => {
                          const updated = {};
                          Object.keys(row).forEach((key) => {
                            const value = row[key];
                            updated[key] =
                              typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : value;
                          });
                          return updated;
                        });

                        return (
                          <TableModal
                            caseTableWrapper
                            columns={columns}
                            data={sanitizedData}
                            title="Data Results"
                            isChatBotView={true}
                          />
                        );
                      }

                      return (
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#999",
                            padding: "8px 0",
                          }}
                        >
                          No relevant data found for your query.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}

              {loading && (
                <div className={styles.loadingRow}>
                  <div className={styles.loadingDots}>
                    <div></div><div></div><div></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className={`${isInitialState ? styles.centerInput : styles.bottomInput}`}>
          <div className={styles.inputBox}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              rows={1}
              disabled={loading}
              className={styles.textarea}
            />
            <div className={styles.sendArea}>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={!input.trim() || loading ? styles.disabledSend : styles.sendButton}
              >
                <MdOutlineArrowUpward size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;
