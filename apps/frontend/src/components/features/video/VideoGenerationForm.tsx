import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { getAvatars, getVoicesForAvatar, generateVideo } from '@/services/video-service';

interface Avatar {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface Voice {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
}

const VideoGenerationForm = () => {
  const [text, setText] = useState('');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch avatars on component mount
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const avatarData = await getAvatars();
        setAvatars(avatarData);
        if (avatarData.length > 0) {
          setSelectedAvatarId(avatarData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch avatars:', error);
        toast({
          title: 'Error',
          description: 'Failed to load avatars. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchAvatars();
  }, [toast]);

  // Fetch voices when avatar selection changes
  useEffect(() => {
    const fetchVoices = async () => {
      if (!selectedAvatarId) return;
      
      try {
        const voiceData = await getVoicesForAvatar(selectedAvatarId);
        setVoices(voiceData);
        if (voiceData.length > 0) {
          setSelectedVoiceId(voiceData[0].id);
        } else {
          setSelectedVoiceId('');
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
        toast({
          title: 'Error',
          description: 'Failed to load voices for the selected avatar.',
          variant: 'destructive',
        });
      }
    };

    fetchVoices();
  }, [selectedAvatarId, toast]);

  const handleAvatarChange = (value: string) => {
    setSelectedAvatarId(value);
    setSelectedVoiceId(''); // Reset voice when avatar changes
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoiceId(value);
  };

  const playVoicePreview = (voiceId: string, previewUrl: string) => {
    // Stop any currently playing audio
    if (audioPlaying) {
      const currentAudio = document.getElementById(audioPlaying) as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Play the selected voice preview
    const audio = document.getElementById(voiceId) as HTMLAudioElement;
    if (audio) {
      audio.play();
      setAudioPlaying(voiceId);
      
      // Reset when audio ends
      audio.onended = () => {
        setAudioPlaying(null);
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text || !selectedAvatarId || !selectedVoiceId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields before generating a video.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await generateVideo({
        text,
        avatarId: selectedAvatarId,
        voiceId: selectedVoiceId,
      });
      
      toast({
        title: 'Video generation started',
        description: 'Your video is being generated. You will be redirected to view its progress.',
      });
      
      // Redirect to the video detail page
      router.push(`/videos/${response.id}`);
    } catch (error) {
      console.error('Failed to generate video:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate video. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Video</CardTitle>
        <CardDescription>
          Enter your text, select an avatar, and choose a voice to generate a lip-sync video.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Text for the video</Label>
            <Textarea
              id="text"
              placeholder="Enter the text you want the avatar to speak..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32"
              required
            />
            <p className="text-sm text-muted-foreground">
              {text.length} characters (recommended: 50-200 characters for best results)
            </p>
          </div>

          <div className="space-y-4">
            <Label>Select an Avatar</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all ${
                    selectedAvatarId === avatar.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-card hover:bg-accent/50 border-2 border-transparent'
                  }`}
                  onClick={() => handleAvatarChange(avatar.id)}
                >
                  <Avatar className="w-24 h-24 mb-2">
                    <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                    <AvatarFallback>{avatar.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-medium">{avatar.name}</h3>
                    <p className="text-sm text-muted-foreground">{avatar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAvatarId && (
            <div className="space-y-4">
              <Label>Select a Voice</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${
                      selectedVoiceId === voice.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-card hover:bg-accent/50 border-2 border-transparent'
                    }`}
                    onClick={() => handleVoiceChange(voice.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{voice.name}</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoicePreview(voice.id, voice.previewUrl);
                        }}
                      >
                        {audioPlaying === voice.id ? 'Playing...' : 'Preview'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{voice.description}</p>
                    <audio id={voice.id} src={voice.previewUrl} preload="none" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={isLoading || !text || !selectedAvatarId || !selectedVoiceId}
          onClick={handleSubmit}
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoGenerationForm; 