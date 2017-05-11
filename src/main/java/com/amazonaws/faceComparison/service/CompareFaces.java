package com.amazonaws.faceComparison.service;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.AmazonRekognitionClientBuilder;
import com.amazonaws.services.rekognition.model.BoundingBox;
import com.amazonaws.services.rekognition.model.CompareFacesMatch;
import com.amazonaws.services.rekognition.model.CompareFacesRequest;
import com.amazonaws.services.rekognition.model.CompareFacesResult;
import com.amazonaws.services.rekognition.model.ComparedFace;
import com.amazonaws.services.rekognition.model.Image;
import com.amazonaws.services.rekognition.model.S3Object;
import org.springframework.web.multipart.MultipartFile;

public class CompareFaces {
	public static final String S3_BUCKET = "S3bucket";

	public static String compare(MultipartFile srcInputStream, MultipartFile tgtInputStream) throws IOException{
        AWSCredentials credentials;
        try {
            credentials = new ProfileCredentialsProvider("rekognition").getCredentials();
        } catch (Exception e) {
            throw new AmazonClientException("Cannot load the credentials from the credential profiles file. "
                    + "Please make sure that your credentials file is at the correct "
                    + "location (/Users/userid/.aws/credentials), and is in valid format.", e);
        }

        AmazonRekognition rekognitionClient = AmazonRekognitionClientBuilder
        		.standard()
        		.withRegion(Regions.US_WEST_2)
        		.withCredentials(new AWSStaticCredentialsProvider(credentials))
        		.build();

        
        
        ByteBuffer srcBuffer;

        srcBuffer = ByteBuffer.wrap(com.amazonaws.util.IOUtils.toByteArray(srcInputStream.getInputStream()));
        
        ByteBuffer tgtBuffer; 
        tgtBuffer = ByteBuffer.wrap(com.amazonaws.util.IOUtils.toByteArray(tgtInputStream.getInputStream()));
        
        
        
        
        Image source = new Image().withBytes(srcBuffer);
        Image target = new Image().withBytes(tgtBuffer);
                
        
        Float similarityThreshold = 70F;
        try{
        	CompareFacesResult compareFacesResult = callCompareFaces(source,
            		target,
            		similarityThreshold,
            		rekognitionClient);


            List <CompareFacesMatch> faceDetails = compareFacesResult.getFaceMatches();        
            for (CompareFacesMatch match: faceDetails){
            	ComparedFace face= match.getFace();
            	BoundingBox position = face.getBoundingBox();
            	return ("{\"mensagem\": \"The faces match with " + face.getConfidence().toString()
            			+ "% confidence.\", \"classe\": \"success\"}");
            }
            if(faceDetails.isEmpty()){
            	return("{\"mensagem\": \"the faces don't match!\", \"classe\": \"danger\"}");
            }
        }catch(Exception e){
        	return ("{\"mensagem\": \"Sorry, I can't seem to find a face in one of the pictures\", \"classe\": \"danger\"}");
        }
        

        return "";
   }

    private static CompareFacesResult callCompareFaces(Image sourceImage, Image targetImage,
            Float similarityThreshold, AmazonRekognition amazonRekognition) {
    	try{
    		CompareFacesRequest compareFacesRequest = new CompareFacesRequest()
    		         .withSourceImage(sourceImage)
    		         .withTargetImage(targetImage)
    		         .withSimilarityThreshold(similarityThreshold);
    		      return amazonRekognition.compareFaces(compareFacesRequest);
    	}catch(Exception e){
    		throw e;
    	}

      
   }

    private static Image getImageUtil(String bucket, String key) {
      return new Image()
          .withS3Object(new S3Object()
                  .withBucket(bucket)
                  .withName(key));
    }

}
