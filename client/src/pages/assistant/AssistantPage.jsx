import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  Shield,
  MessageSquare,
  RefreshCw,
  Info
} from 'lucide-react';

const API_BASE = '/api/v1';

export default function AssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState([]);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const sampleStarters = [
    {
      category: 'Library',
      query: 'What are the library borrowing limits and late fine rules?',
    },
    {
      category: 'Printing',
      query: 'What are the Xerox center printing rates and counter locations?',
    },
    {
      category: 'Academics',
      query: 'Where is the Academic Section counter and what are its timings?',
    },
    {
      category: 'Campus Security',
      query: 'What is the procedure to claim a recovered item at Security?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchConversationDetails(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/assistant/conversations`);
      const convList = res.data?.data?.conversations || [];
      setConversations(convList);
      if (convList.length > 0 && !activeConversationId) {
        setActiveConversationId(convList[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Unable to load previous inquiries. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (id) => {
    try {
      setError(null);
      const res = await axios.get(`${API_BASE}/assistant/conversations/${id}`);
      setActiveConversation(res.data?.data?.conversation || null);
      setMessages(res.data?.data?.messages || []);
      setSuggestedFollowups([]);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
      setError('Failed to load message history.');
    }
  };

  const handleCreateNewConversation = async (initialQuery = null) => {
    try {
      setError(null);
      const res = await axios.post(`${API_BASE}/assistant/conversations`, {
        title: initialQuery ? (initialQuery.length > 30 ? initialQuery.substring(0, 27) + '...' : initialQuery) : 'New Campus Inquiry'
      });
      const newConv = res.data?.data?.conversation;
      if (newConv) {
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        setActiveConversation(newConv);
        setMessages([]);
        setSuggestedFollowups([]);
        if (initialQuery) {
          sendMessage(newConv.id, initialQuery);
        }
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Could not start a new inquiry thread.');
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inquiry thread?')) return;

    try {
      await axios.delete(`${API_BASE}/assistant/conversations/${convId}`);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete thread.');
    }
  };

  const sendMessage = async (targetConvId, queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || sending) return;

    let convId = targetConvId || activeConversationId;

    if (!convId) {
      await handleCreateNewConversation(textToSend.trim());
      setInputQuery('');
      return;
    }

    const optimisticUserMsg = {
      id: Date.now(),
      conversation_id: convId,
      sender: 'user',
      content: textToSend.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputQuery('');
    setSending(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/assistant/conversations/${convId}/messages`, {
        content: textToSend.trim(),
      });

      const { userMessage, assistantMessage } = res.data.data;
      setMessages((prev) => [
        ...prev.slice(0, -1),
        userMessage,
        assistantMessage,
      ]);

      if (assistantMessage.suggested_followups && assistantMessage.suggested_followups.length > 0) {
        setSuggestedFollowups(assistantMessage.suggested_followups);
      }

      // Refresh list to update conversation title and updated_at
      const listRes = await axios.get(`${API_BASE}/assistant/conversations`);
      setConversations(listRes.data?.data?.conversations || []);
    } catch (err) {
      console.error('Error sending query:', err);
      setError('Failed to receive response from campus assistant. Please retry.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(null, inputQuery);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Campus Assistant"
        subtitle="Inquiry assistant strictly grounded in verified university circulars, regulations, and official directory entries"
        breadcrumbs={['Campus Services', 'AI Assistant']}
        badge={<Badge variant="accent" dot>Grounding Active</Badge>}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCreateNewConversation()}
            icon={Plus}
          >
            New Inquiry
          </Button>
        }
      />

      {/* Top System Notice */}
      <div className="p-3.5 rounded-lg bg-surface border border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-text">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent flex-shrink-0" />
          <span>
            <strong className="text-navy-950 font-medium">Zero-Hallucination Policy:</strong> Answers cite official manuals or explicitly decline unverified inquiries.
          </span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto text-[11px] text-slate-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            FastAPI NLP Subsystem Online
          </span>
          <span className="text-slate-border">•</span>
          <span>10 Verified Knowledge Domains</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 font-medium hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px]">
        {/* Sidebar: Conversation Threads */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-text">
              Inquiry History
            </h3>
            <span className="text-xs text-slate-muted">
              {conversations.length} {conversations.length === 1 ? 'thread' : 'threads'}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-border text-center">
                <p className="text-xs text-slate-muted">No inquiry threads yet.</p>
                <button
                  onClick={() => handleCreateNewConversation()}
                  className="mt-2 text-xs text-accent font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Start first inquiry
                </button>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                        : 'bg-surface hover:bg-slate-50 border-slate-border text-navy-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive ? 'text-accent-300' : 'text-slate-muted'
                            }`}
                          />
                          <p className="text-xs font-medium truncate">{c.title}</p>
                        </div>
                        {c.last_message && (
                          <p
                            className={`text-[11px] mt-1 truncate ${
                              isActive ? 'text-slate-300' : 'text-slate-text'
                            }`}
                          >
                            {c.last_message}
                          </p>
                        )}
                        <span
                          className={`text-[10px] block mt-1.5 ${
                            isActive ? 'text-slate-400' : 'text-slate-muted'
                          }`}
                        >
                          {new Date(c.updated_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, c.id)}
                        title="Delete inquiry"
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                          isActive
                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                            : 'text-slate-muted hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Conversation & Query Pane */}
        <div className="lg:col-span-3 flex flex-col bg-surface border border-slate-border rounded-xl shadow-xs overflow-hidden">
          {/* Conversation Header */}
          <div className="px-5 py-3.5 border-b border-slate-border bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-navy-950">
                  {activeConversation ? activeConversation.title : 'New Campus Inquiry'}
                </h4>
                <p className="text-[11px] text-slate-muted">
                  Strictly grounded against verified campus regulations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-muted hidden sm:inline">
                {messages.length} messages
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[500px]">
            {messages.length === 0 ? (
              <div className="py-8 text-center max-w-lg mx-auto space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-800 mx-auto flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-950">
                    How can I assist you with campus information today?
                  </h3>
                  <p className="text-xs text-slate-text mt-1 leading-relaxed">
                    Ask questions regarding library loans, examination revaluation, Xerox printing rates, canteen counter timings, or lost item claim procedures.
                  </p>
                </div>

                <div className="text-left pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted block mb-2 text-center">
                    Verified Campus Inquiry Starters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleStarters.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(activeConversationId, item.query)}
                        className="p-3 text-left rounded-lg border border-slate-border bg-surface hover:bg-slate-50 hover:border-slate-300 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium text-accent mb-1">
                          <span>{item.category}</span>
                          <ArrowRight className="w-3 h-3 text-slate-muted" />
                        </div>
                        <p className="text-xs text-navy-950 font-normal leading-snug">
                          {item.query}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-navy-950 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-border text-navy-950 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider opacity-75">
                            {isUser ? 'You' : 'UniMate Assistant'}
                          </span>
                          {!isUser && msg.provider_used === 'gemini' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                              Gemini Grounded
                            </span>
                          )}
                          {!isUser && msg.provider_used === 'deterministic_fallback' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">
                              Fallback Extraction
                            </span>
                          )}
                          {!isUser && (!msg.provider_used || msg.provider_used === 'deterministic') && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              Verified Corpus
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Official Sources Citation Box */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-border/80">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-900 mb-1.5">
                            <FileText className="w-3.5 h-3.5 text-accent" />
                            <span>Verified Reference Source:</span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2 rounded bg-slate-50 border border-slate-border text-[11px]"
                              >
                                <span className="font-semibold text-navy-950 block">{src.title}</span>
                                <span className="text-slate-muted text-[10px] block mt-0.5">
                                  Ref: {src.source}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-border rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs">
                  <div className="flex items-center gap-2 text-slate-text">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                    <span>Searching verified campus knowledge base...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Followups */}
          {suggestedFollowups.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-border flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-medium text-slate-muted flex-shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" /> Related:
              </span>
              <div className="flex items-center gap-2">
                {suggestedFollowups.map((followup, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(activeConversationId, followup)}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-border hover:border-slate-300 hover:bg-slate-50 text-[11px] text-navy-950 whitespace-nowrap transition-colors"
                  >
                    {followup}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Input Box */}
          <div className="p-4 border-t border-slate-border bg-white">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about library borrowing, print rates, office hours, or lost items..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-border bg-slate-50/50 text-xs text-navy-950 placeholder:text-slate-muted focus:outline-none focus:ring-1 focus:ring-navy-900 focus:bg-white"
                disabled={sending}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputQuery.trim() || sending}
                icon={Send}
              >
                Send
              </Button>
            </form>
            <p className="text-[10px] text-slate-muted mt-2 text-center">
              The AI Campus Assistant will decline ungrounded questions to avoid hallucinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
